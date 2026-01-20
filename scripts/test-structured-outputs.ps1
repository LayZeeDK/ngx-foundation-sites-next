#!/usr/bin/env pwsh
# Test script for structured outputs with gap analysis
# Run this OUTSIDE of Claude Code session to test CLI invocation

$ErrorActionPreference = "Stop"

Write-Host "🧪 Testing Structured Outputs for Gap Analysis" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host ""

# Get current feature from git branch
$branch = git rev-parse --abbrev-ref HEAD
$featureDir = "specs/$branch"

if (-not (Test-Path $featureDir)) {
    Write-Host "❌ Error: Feature directory not found: $featureDir" -ForegroundColor Red
    Write-Host "   Current branch: $branch" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Feature detected: $branch" -ForegroundColor Green
Write-Host "📁 Feature directory: $featureDir"
Write-Host ""

# Minified JSON schema (from .claude/skills/analyze-report-gaps/SKILL.md)
$schema = '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"feature_name":{"type":"string"},"analysis_date":{"type":"string","format":"date"},"analyst":{"type":"string","const":"Claude Haiku 4.5"},"method":{"type":"string","const":"6-pass cross-artifact consistency analysis"},"findings":{"type":"array","maxItems":50,"items":{"type":"object","properties":{"id":{"type":"string","pattern":"^[DAUCGI]\\d{2}$"},"category":{"type":"string","enum":["Duplication","Ambiguity","Underspecification","ConstitutionAlignment","CoverageGap","Inconsistency"]},"severity":{"type":"string","enum":["CRITICAL","HIGH","MEDIUM","LOW"]},"locations":{"type":"array","items":{"type":"string"}},"summary":{"type":"string"},"recommendation":{"type":"string"}},"required":["id","category","severity","locations","summary","recommendation"]}},"coverage_summary":{"type":"array","items":{"type":"object","properties":{"requirement_key":{"type":"string"},"has_task":{"type":"boolean"},"task_ids":{"type":"array","items":{"type":"string"}},"notes":{"type":"string"}},"required":["requirement_key","has_task","task_ids"]}},"constitution_issues":{"type":"array","items":{"type":"object","properties":{"principle":{"type":"string"},"violation":{"type":"string"},"location":{"type":"string"}},"required":["principle","violation","location"]}},"unmapped_tasks":{"type":"array","items":{"type":"object","properties":{"task_id":{"type":"string"},"description":{"type":"string"}},"required":["task_id","description"]}},"metrics":{"type":"object","properties":{"total_requirements":{"type":"integer","minimum":0},"total_tasks":{"type":"integer","minimum":0},"coverage_percentage":{"type":"number","minimum":0,"maximum":100},"ambiguity_count":{"type":"integer","minimum":0},"duplication_count":{"type":"integer","minimum":0},"critical_issues":{"type":"integer","minimum":0}},"required":["total_requirements","total_tasks","coverage_percentage","critical_issues"]},"next_actions":{"type":"array","items":{"type":"string"}}},"required":["feature_name","analysis_date","analyst","method","findings","metrics"]}'

Write-Host "📋 Schema loaded ($($schema.Length) bytes)"
Write-Host ""

# Enable debug output in nested session
$env:DEBUG_ANALYSIS = "1"

Write-Host "🚀 Invoking Claude CLI with structured outputs..." -ForegroundColor Cyan
Write-Host "   Model: Haiku 4.5"
Write-Host "   Flags: --print --output-format json --json-schema"
Write-Host "   Note: Permission/tools flags removed (cause errors with --print)"
Write-Host ""

$outputFile = "$featureDir/gap-analysis-cli-output.json"

# Build a natural language prompt that should trigger skill auto-invocation
# Skill description: "Cross-artifact consistency analysis with file output (Haiku 4.5)"
$analysisPrompt = @"
Perform a cross-artifact consistency analysis for the feature in branch '$branch'.

Analyze gaps and inconsistencies across spec.md, plan.md, and tasks.md using the 6-pass detection methodology:
- Duplication Detection
- Ambiguity Detection
- Underspecification Detection
- Constitution Alignment
- Coverage Gap Detection
- Inconsistency Detection

Output the analysis as JSON matching the provided schema with:
- feature_name
- analysis_date
- findings array (with id, category, severity, locations, summary, recommendation)
- coverage_summary
- metrics (total_requirements, total_tasks, coverage_percentage, critical_issues)

The feature directory is: $featureDir
"@

Write-Host "📝 Using natural language prompt to trigger skill auto-invocation"
Write-Host ""

$outputFile = "$featureDir/gap-analysis-cli-output.json"

# Invoke with permission flags
# Use PowerShell splatting to avoid backtick continuation issues
# NOTE: --tools flag causes errors with --print (breaks positional arg parsing)
# --permission-mode is OK and may help skip prompts in nested sessions
$claudeArgs = @(
    '--print'
    '--model', 'haiku'
    '--output-format', 'json'
    '--json-schema', $schema
    '--permission-mode', 'bypassPermissions'  # OK: Helps skip permission prompts
    $analysisPrompt  # Prompt as final positional argument
)

Write-Host "🔍 Debug: Prompt length: $($analysisPrompt.Length) characters" -ForegroundColor Yellow
Write-Host "🔍 Debug: First 100 chars: $($analysisPrompt.Substring(0, [Math]::Min(100, $analysisPrompt.Length)))..." -ForegroundColor Yellow
Write-Host "🔍 Debug: Args count: $($claudeArgs.Count)" -ForegroundColor Yellow
Write-Host "🔍 Debug: Last arg (prompt): '$($claudeArgs[-1].Substring(0, 50))...'" -ForegroundColor Yellow
Write-Host ""

# First, test if basic invocation works with a simple prompt
Write-Host "🧪 Testing basic CLI invocation with simple prompt..." -ForegroundColor Cyan
$testOutput = & claude --print --model haiku "Say hello" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Basic invocation works!" -ForegroundColor Green
} else {
    Write-Host "❌ Basic invocation failed! Error: $testOutput" -ForegroundColor Red
    Write-Host "   This suggests a problem with Claude CLI itself" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Show what command we're about to run
Write-Host "🔍 Command that will be executed:" -ForegroundColor Yellow
Write-Host "   claude $($claudeArgs -join ' ')" -ForegroundColor Gray
Write-Host "   (Prompt text truncated in display above)" -ForegroundColor Gray
Write-Host ""

try {
    # Execute without redirect first, capture output differently
    # PowerShell redirect operators can interfere with argument parsing
    $output = & claude @claudeArgs 2>&1
    $exitCode = $LASTEXITCODE

    # Write output to file
    $output | Out-File -FilePath $outputFile -Encoding UTF8
}
catch {
    Write-Host "❌ Exception during CLI invocation: $_" -ForegroundColor Red
    exit 1
}

if ($exitCode -eq 0) {
    Write-Host "✅ CLI invocation succeeded (exit code 0)" -ForegroundColor Green
    Write-Host ""

    # Check if output file has content
    if ((Test-Path $outputFile) -and ((Get-Item $outputFile).Length -gt 0)) {
        $fileSize = (Get-Item $outputFile).Length
        Write-Host "✅ Output file created: $outputFile" -ForegroundColor Green
        Write-Host "   Size: $fileSize bytes"
        Write-Host ""

        # Extract structured_output field
        if (Get-Command jq -ErrorAction SilentlyContinue) {
            Write-Host "🔍 Extracting structured_output field..."
            $reportFile = "$featureDir/gap-analysis-report.json"

            & jq '.structured_output' $outputFile > $reportFile

            if ($LASTEXITCODE -eq 0) {
                $findingsCount = & jq '.findings | length' $reportFile
                $criticalCount = & jq '[.findings[] | select(.severity == "CRITICAL")] | length' $reportFile

                Write-Host "✅ Structured output extracted: $reportFile" -ForegroundColor Green
                Write-Host ""
                Write-Host "📊 Analysis Results:" -ForegroundColor Cyan
                Write-Host "   Total findings: $findingsCount"
                Write-Host "   Critical issues: $criticalCount"
                Write-Host ""

                # Cleanup temp file
                Remove-Item $outputFile -Force

                Write-Host "🎉 Success! Structured outputs working correctly." -ForegroundColor Green
            }
            else {
                Write-Host "❌ Failed to extract structured_output field" -ForegroundColor Red
                Write-Host "   Raw output: $outputFile"
                exit 1
            }
        }
        else {
            Write-Host "⚠️  jq not found - cannot extract structured_output field" -ForegroundColor Yellow
            Write-Host "   Raw output: $outputFile"
            Write-Host "   Install jq to complete extraction"
            Write-Host "   Download from: https://jqlang.github.io/jq/download/"
        }
    }
    else {
        Write-Host "❌ Output file is empty or missing" -ForegroundColor Red
        Write-Host "   File: $outputFile"
        exit 1
    }
}
else {
    Write-Host "❌ CLI invocation failed (exit code $exitCode)" -ForegroundColor Red

    if (Test-Path $outputFile) {
        Write-Host ""
        Write-Host "📄 Error output:" -ForegroundColor Yellow
        Get-Content $outputFile
    }

    exit $exitCode
}

# Check debug log if it exists
$debugLog = "$featureDir/gap-analysis-debug.log"
if (Test-Path $debugLog) {
    Write-Host ""
    Write-Host "📝 Debug log:" -ForegroundColor Cyan
    Get-Content $debugLog
}

Write-Host ""
Write-Host "✨ Test complete!" -ForegroundColor Green
