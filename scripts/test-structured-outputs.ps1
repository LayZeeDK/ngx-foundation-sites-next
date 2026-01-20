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

# JSON schema (from .claude/skills/analyze-report-gaps/SKILL.md)
# Save to temp file to avoid shell argument length issues
$schemaFile = "$env:TEMP/gap-analysis-schema.json"
$schemaContent = @"
{
  "`$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "feature_name": {"type": "string"},
    "analysis_date": {"type": "string", "format": "date"},
    "analyst": {"type": "string", "const": "Claude Haiku 4.5"},
    "method": {"type": "string", "const": "6-pass cross-artifact consistency analysis"},
    "findings": {
      "type": "array",
      "maxItems": 50,
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string", "pattern": "^[DAUCGI]\\d{2}`$"},
          "category": {"type": "string", "enum": ["Duplication", "Ambiguity", "Underspecification", "ConstitutionAlignment", "CoverageGap", "Inconsistency"]},
          "severity": {"type": "string", "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]},
          "locations": {"type": "array", "items": {"type": "string"}},
          "summary": {"type": "string"},
          "recommendation": {"type": "string"}
        },
        "required": ["id", "category", "severity", "locations", "summary", "recommendation"]
      }
    },
    "coverage_summary": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "requirement_key": {"type": "string"},
          "has_task": {"type": "boolean"},
          "task_ids": {"type": "array", "items": {"type": "string"}},
          "notes": {"type": "string"}
        },
        "required": ["requirement_key", "has_task", "task_ids"]
      }
    },
    "metrics": {
      "type": "object",
      "properties": {
        "total_requirements": {"type": "integer", "minimum": 0},
        "total_tasks": {"type": "integer", "minimum": 0},
        "coverage_percentage": {"type": "number", "minimum": 0, "maximum": 100},
        "critical_issues": {"type": "integer", "minimum": 0}
      },
      "required": ["total_requirements", "total_tasks", "coverage_percentage", "critical_issues"]
    }
  },
  "required": ["feature_name", "analysis_date", "analyst", "method", "findings", "metrics"]
}
"@

# Write schema to temp file
$schemaContent | Out-File -FilePath $schemaFile -Encoding UTF8

Write-Host "📋 Schema saved to: $schemaFile"
Write-Host "   Size: $((Get-Item $schemaFile).Length) bytes"
Write-Host ""

# Enable debug output in nested session
$env:DEBUG_ANALYSIS = "1"

Write-Host "🚀 Invoking Claude CLI with structured outputs..." -ForegroundColor Cyan
Write-Host "   Model: Haiku 4.5"
Write-Host "   Flags: --print --output-format json --json-schema (file)"
Write-Host "   Permissions: --dangerously-skip-permissions"
Write-Host "   Allowed dirs: $featureDir, .specify"
Write-Host "   Schema: Using temp file (avoids shell arg length limits)"
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
# Use schema FILE instead of inline to avoid shell argument length limits
# Use --dangerously-skip-permissions (Test 8 proved this works)
# Add current directory to allowed paths (skill needs to read specs/, .specify/)
$claudeArgs = @(
    '--print'
    '--model', 'haiku'
    '--output-format', 'json'
    '--json-schema', $schemaFile  # Use file path instead of inline JSON
    '--dangerously-skip-permissions'  # Skip ALL permission prompts
    '--add-dir', '.'  # Allow access to entire repo (includes specs/, .specify/)
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
    # Execute with manual timeout monitoring
    Write-Host "⏱️  Starting (manual timeout monitoring: 2 minutes)..." -ForegroundColor Cyan
    Write-Host "🔍 Debug: Executing command (args count: $($claudeArgs.Count))" -ForegroundColor Yellow
    Write-Host "⚠️  Note: Press Ctrl+C if it runs longer than 2 minutes" -ForegroundColor Yellow
    Write-Host ""

    # Start timer for monitoring
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Execute directly - Start-Process doesn't work with npm scripts
    # The & operator works with any command type (exe, bat, ps1, npm scripts)
    $output = & claude @claudeArgs 2>&1
    $exitCode = $LASTEXITCODE

    $stopwatch.Stop()
    $elapsedSeconds = [math]::Round($stopwatch.Elapsed.TotalSeconds, 1)

    # Write output to file
    $output | Out-File -FilePath $outputFile -Encoding UTF8

    if ($exitCode -eq 0) {
        Write-Host "✅ Completed successfully in $elapsedSeconds seconds" -ForegroundColor Green
    } else {
        Write-Host "❌ Command failed with exit code: $exitCode (after $elapsedSeconds seconds)" -ForegroundColor Red
    }
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

        # Extract structured_output field using PowerShell (no jq needed!)
        Write-Host "🔍 Extracting structured_output field (PowerShell native)..." -ForegroundColor Cyan

        try {
            $jsonContent = Get-Content $outputFile -Raw | ConvertFrom-Json
            $reportFile = "$featureDir/gap-analysis-report.json"

            # Check if structured_output field exists
            if ($jsonContent.PSObject.Properties.Name -contains 'structured_output') {
                $structuredOutput = $jsonContent.structured_output

                # Write to report file
                $structuredOutput | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportFile -Encoding UTF8

                # Get metrics
                $findingsCount = $structuredOutput.findings.Count
                $criticalCount = ($structuredOutput.findings | Where-Object { $_.severity -eq "CRITICAL" }).Count

                Write-Host "✅ Structured output extracted: $reportFile" -ForegroundColor Green
                Write-Host ""
                Write-Host "📊 Analysis Results:" -ForegroundColor Cyan
                Write-Host "   Total findings: $findingsCount"
                Write-Host "   Critical issues: $criticalCount"
                Write-Host ""

                # Cleanup temp files
                Remove-Item $outputFile -Force
                Remove-Item $schemaFile -Force

                Write-Host "🎉 Success! Structured outputs working correctly." -ForegroundColor Green
            } else {
                Write-Host "⚠️  No structured_output field found in response" -ForegroundColor Yellow
                Write-Host "   Available fields: $($jsonContent.PSObject.Properties.Name -join ', ')" -ForegroundColor Yellow
                Write-Host ""

                # Show what we got instead
                if ($jsonContent.PSObject.Properties.Name -contains 'result') {
                    Write-Host "📄 Response result (first 300 chars):" -ForegroundColor Cyan
                    $resultText = $jsonContent.result
                    Write-Host $resultText.Substring(0, [Math]::Min(300, $resultText.Length))
                    Write-Host ""
                    Write-Host "⚠️  Structured outputs weren't activated. Check:" -ForegroundColor Yellow
                    Write-Host "   1. Is --json-schema flag working?" -ForegroundColor Yellow
                    Write-Host "   2. Did skill auto-invocation happen?" -ForegroundColor Yellow
                    Write-Host "   3. Is the natural language prompt close enough to skill description?" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "❌ Failed to parse JSON output: $_" -ForegroundColor Red
            Write-Host ""
            Write-Host "📄 Raw file content:" -ForegroundColor Yellow
            Get-Content $outputFile
            exit 1
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
