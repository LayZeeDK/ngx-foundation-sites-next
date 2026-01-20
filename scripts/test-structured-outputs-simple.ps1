#!/usr/bin/env pwsh
# Simplest possible test for structured outputs
# No async, no jobs, no runspaces - just direct execution

$ErrorActionPreference = "Stop"

Write-Host "🧪 Simple Structured Outputs Test (Synchronous)" -ForegroundColor Cyan
Write-Host "================================================"
Write-Host ""

# Get feature
$branch = git rev-parse --abbrev-ref HEAD
$featureDir = "specs/$branch"

Write-Host "✅ Feature: $branch"
Write-Host "📁 Directory: $featureDir"
Write-Host ""

# Save schema to file
$schemaFile = "$env:TEMP/gap-analysis-schema.json"
$schemaContent = @"
{
  "`$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "feature_name": {"type": "string"},
    "analysis_date": {"type": "string"},
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "category": {"type": "string"},
          "severity": {"type": "string"},
          "summary": {"type": "string"}
        }
      }
    },
    "metrics": {
      "type": "object",
      "properties": {
        "total_requirements": {"type": "integer"},
        "total_tasks": {"type": "integer"},
        "critical_issues": {"type": "integer"}
      }
    }
  },
  "required": ["feature_name", "findings", "metrics"]
}
"@

$schemaContent | Out-File -FilePath $schemaFile -Encoding UTF8
Write-Host "📋 Schema: $schemaFile"
Write-Host ""

# Read the skill file and use it as the prompt!
$skillFile = ".claude/skills/analyze-report-gaps-haiku-4-5/SKILL.md"

if (-not (Test-Path $skillFile)) {
    Write-Host "❌ Skill file not found: $skillFile" -ForegroundColor Red
    exit 1
}

Write-Host "📖 Loading skill file: $skillFile" -ForegroundColor Cyan
$skillContent = Get-Content $skillFile -Raw

Write-Host "   Size: $($skillContent.Length) characters" -ForegroundColor Gray
Write-Host "   Lines: $((Get-Content $skillFile).Count)" -ForegroundColor Gray
Write-Host ""

# Use the full skill content as the prompt
$prompt = $skillContent

Write-Host "📝 Prompt: Using full SKILL.md contents" -ForegroundColor Cyan
Write-Host "   First 100 chars: $($prompt.Substring(0, 100))..." -ForegroundColor Gray
Write-Host ""

# Output file
$outputFile = "$featureDir/gap-analysis-test-output.json"

# Clean up old output files first
if (Test-Path $outputFile) {
    Remove-Item $outputFile -Force
    Write-Host "🧹 Cleaned up old output file" -ForegroundColor Yellow
}
if (Test-Path "$featureDir/gap-analysis-cli-output.json") {
    Remove-Item "$featureDir/gap-analysis-cli-output.json" -Force
    Write-Host "🧹 Cleaned up old CLI output file" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "🚀 Executing (this will block until complete)..." -ForegroundColor Cyan
Write-Host "   ⚠️  Expected: 3-5 minutes (skill documentation shows 20-35s, but actual is ~3min)"
Write-Host "   ⚠️  Press Ctrl+C to cancel if needed"
Write-Host ""

# Start stopwatch
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

# Execute synchronously - simplest approach
$output = & claude --print --model haiku --output-format json --json-schema $schemaFile --dangerously-skip-permissions --add-dir '.' $prompt 2>&1

$stopwatch.Stop()
$exitCode = $LASTEXITCODE
$elapsed = [math]::Round($stopwatch.Elapsed.TotalSeconds, 1)

Write-Host "✅ Completed in $elapsed seconds (exit code: $exitCode)" -ForegroundColor Green
Write-Host ""

# Save output
$output | Out-File -FilePath $outputFile -Encoding UTF8

# Check result
if (Test-Path $outputFile) {
    $size = (Get-Item $outputFile).Length
    Write-Host "📄 Output file: $outputFile"
    Write-Host "   Size: $size bytes"
    Write-Host ""

    if ($size -gt 100) {
        # Try to parse
        try {
            $json = Get-Content $outputFile -Raw | ConvertFrom-Json

            if ($json.PSObject.Properties.Name -contains 'structured_output') {
                Write-Host "✅ SUCCESS! Found structured_output field" -ForegroundColor Green
                Write-Host ""

                $structured = $json.structured_output
                Write-Host "📊 Results:" -ForegroundColor Cyan
                Write-Host "   Feature: $($structured.feature_name)"
                Write-Host "   Findings: $($structured.findings.Count)"
                if ($structured.metrics) {
                    Write-Host "   Critical: $($structured.metrics.critical_issues)"
                }

                # Save clean version
                $structured | ConvertTo-Json -Depth 10 | Out-File "$featureDir/gap-analysis-report.json" -Encoding UTF8
                Write-Host ""
                Write-Host "✅ Extracted to: $featureDir/gap-analysis-report.json" -ForegroundColor Green
            } else {
                Write-Host "⚠️  No structured_output field found" -ForegroundColor Yellow
                Write-Host "   Available fields: $($json.PSObject.Properties.Name -join ', ')"
                Write-Host ""
                if ($json.result) {
                    Write-Host "📄 Result (first 200 chars):" -ForegroundColor Cyan
                    Write-Host $json.result.Substring(0, [Math]::Min(200, $json.result.Length))
                }
            }
        } catch {
            Write-Host "❌ JSON parse error: $_" -ForegroundColor Red
            Write-Host ""
            Write-Host "📄 Raw content:" -ForegroundColor Yellow
            Get-Content $outputFile
        }
    } else {
        Write-Host "❌ Output too small ($size bytes) - likely an error" -ForegroundColor Red
        Get-Content $outputFile
    }
}

Write-Host ""
Write-Host "⏱️  Total time: $elapsed seconds" -ForegroundColor Cyan
