#!/usr/bin/env pwsh
# Benchmark script for analyze-report-gaps-haiku-4-5 skill

$ErrorActionPreference = "Stop"

Write-Host "⏱️  Benchmark: analyze-report-gaps-haiku-4-5 Skill" -ForegroundColor Cyan
Write-Host "=================================================="
Write-Host ""

# Get current feature from git branch
$branch = git rev-parse --abbrev-ref HEAD
$featureDir = "specs/$branch"

if (-not (Test-Path $featureDir)) {
    Write-Host "❌ Error: Feature directory not found: $featureDir" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Feature: $branch" -ForegroundColor Green
Write-Host "📁 Directory: $featureDir"
Write-Host ""

# Check file sizes for context
$specSize = if (Test-Path "$featureDir/spec.md") { (Get-Item "$featureDir/spec.md").Length } else { 0 }
$planSize = if (Test-Path "$featureDir/plan.md") { (Get-Item "$featureDir/plan.md").Length } else { 0 }
$tasksSize = if (Test-Path "$featureDir/tasks.md") { (Get-Item "$featureDir/tasks.md").Length } else { 0 }

Write-Host "📊 Input file sizes:" -ForegroundColor Cyan
Write-Host "   spec.md:  $([math]::Round($specSize/1024, 1)) KB"
Write-Host "   plan.md:  $([math]::Round($planSize/1024, 1)) KB"
Write-Host "   tasks.md: $([math]::Round($tasksSize/1024, 1)) KB"
Write-Host ""

# Backup existing report if it exists
$reportPath = "$featureDir/gap-analysis-report.md"
if (Test-Path $reportPath) {
    $backupPath = "$reportPath.backup"
    Copy-Item $reportPath $backupPath -Force
    Write-Host "💾 Backed up existing report to: $backupPath" -ForegroundColor Yellow
    Write-Host ""
}

# Run the skill and measure time
Write-Host "🚀 Starting skill execution..." -ForegroundColor Cyan
Write-Host "   Skill: analyze-report-gaps-haiku-4-5"
Write-Host "   Output: $reportPath"
Write-Host ""
Write-Host "⏱️  Running... (progress updates every 10 seconds)" -ForegroundColor Yellow
Write-Host ""

# Start stopwatch
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

# Execute skill via Claude CLI in --print mode
$skillPrompt = "/analyze-report-gaps-haiku-4-5"

# Create runspace for async execution with progress
$runspace = [runspacefactory]::CreateRunspace()
$runspace.Open()

$powershell = [powershell]::Create()
$powershell.Runspace = $runspace

$null = $powershell.AddScript({
    param($prompt)
    & claude --print --model haiku $prompt 2>&1
}).AddArgument($skillPrompt)

$asyncResult = $powershell.BeginInvoke()

# Monitor with progress updates
$lastUpdate = 0
while (-not $asyncResult.IsCompleted) {
    Start-Sleep -Milliseconds 500
    $elapsed = [math]::Round($stopwatch.Elapsed.TotalSeconds, 0)

    # Update every 10 seconds
    if ($elapsed -ge ($lastUpdate + 10)) {
        Write-Host "   ⏱️  Elapsed: $elapsed seconds..." -ForegroundColor Gray
        $lastUpdate = $elapsed

        # Milestones
        if ($elapsed -eq 30) {
            Write-Host "   📌 30 seconds (expected range: 20-35s)" -ForegroundColor Cyan
        }
        if ($elapsed -eq 60) {
            Write-Host "   ⚠️  1 minute (slower than expected)" -ForegroundColor Yellow
        }
        if ($elapsed -eq 120) {
            Write-Host "   ⚠️  2 minutes (significantly slower)" -ForegroundColor Yellow
        }
    }

    # Auto-stop at 5 minutes (something's wrong)
    if ($elapsed -ge 300) {
        Write-Host "   🛑 5 minutes exceeded - stopping" -ForegroundColor Red
        $powershell.Stop()
        break
    }
}

$stopwatch.Stop()

# Get results
$output = $powershell.EndInvoke($asyncResult)
$hadErrors = $powershell.HadErrors

# Cleanup
$powershell.Dispose()
$runspace.Close()

# Calculate timing
$elapsedSeconds = [math]::Round($stopwatch.Elapsed.TotalSeconds, 1)
$elapsedMinutes = [math]::Round($stopwatch.Elapsed.TotalMinutes, 2)

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "⏱️  BENCHMARK RESULTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total execution time: $elapsedSeconds seconds ($elapsedMinutes minutes)" -ForegroundColor White
Write-Host ""

# Performance assessment
if ($elapsedSeconds -lt 20) {
    Write-Host "⚡ Performance: Excellent (faster than expected)" -ForegroundColor Green
} elseif ($elapsedSeconds -le 35) {
    Write-Host "✅ Performance: Normal (within expected 20-35s range)" -ForegroundColor Green
} elseif ($elapsedSeconds -le 60) {
    Write-Host "⚠️  Performance: Slower than expected (35-60s)" -ForegroundColor Yellow
} elseif ($elapsedSeconds -le 120) {
    Write-Host "⚠️  Performance: Significantly slower (1-2 minutes)" -ForegroundColor Yellow
} else {
    Write-Host "❌ Performance: Problematic (>2 minutes)" -ForegroundColor Red
}

Write-Host ""

# Check if report was created
if (Test-Path $reportPath) {
    $reportSize = (Get-Item $reportPath).Length
    $reportLines = (Get-Content $reportPath).Count

    Write-Host "📄 Output report:" -ForegroundColor Cyan
    Write-Host "   File: $reportPath"
    Write-Host "   Size: $([math]::Round($reportSize/1024, 1)) KB"
    Write-Host "   Lines: $reportLines"
    Write-Host ""

    # Quick parse for findings count
    $reportContent = Get-Content $reportPath -Raw
    if ($reportContent -match 'Total findings:\s*(\d+)') {
        Write-Host "   Findings: $($matches[1])" -ForegroundColor White
    }
    if ($reportContent -match 'Critical issues:\s*(\d+)') {
        Write-Host "   Critical: $($matches[1])" -ForegroundColor White
    }
    if ($reportContent -match 'Coverage:\s*(\d+)%') {
        Write-Host "   Coverage: $($matches[1])%" -ForegroundColor White
    }

    Write-Host ""
    Write-Host "✅ Skill executed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Report file not created!" -ForegroundColor Red
    Write-Host "   Expected: $reportPath"
    Write-Host ""
    Write-Host "📄 CLI output (first 500 chars):" -ForegroundColor Yellow
    $outputStr = $output | Out-String
    Write-Host $outputStr.Substring(0, [Math]::Min(500, $outputStr.Length))
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Timing breakdown estimates (based on expected performance)
Write-Host "📊 Expected timing breakdown:" -ForegroundColor Cyan
Write-Host "   Step 1: Path discovery       ~2s"
Write-Host "   Step 2: Load artifacts       ~5-10s (depends on spec.md size)"
Write-Host "   Step 3: Build semantic models ~3-5s"
Write-Host "   Step 4-6: Detection passes    ~8-12s"
Write-Host "   Step 7: Write report         ~2-3s"
Write-Host "   Total expected: 20-35 seconds"
Write-Host ""
Write-Host "   Your result: $elapsedSeconds seconds"
Write-Host ""
