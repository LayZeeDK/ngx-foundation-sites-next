#!/usr/bin/env pwsh
# Minimal test for structured outputs

$ErrorActionPreference = "Stop"

Write-Host "🧪 Minimal Structured Outputs Test" -ForegroundColor Cyan
Write-Host "==================================="
Write-Host ""

# Simple schema
$schema = '{"type":"object","properties":{"test":{"type":"boolean"},"message":{"type":"string"}},"required":["test","message"]}'

# Simple prompt
$prompt = "Return a JSON object with test=true and message='Hello from structured outputs'"

Write-Host "Test 1: Basic --print with prompt" -ForegroundColor Yellow
$result1 = & claude --print --model haiku $prompt 2>&1
Write-Host "Exit code: $LASTEXITCODE"
Write-Host "Output: $result1"
Write-Host ""

Write-Host "Test 2: With --output-format json" -ForegroundColor Yellow
$result2 = & claude --print --model haiku --output-format json $prompt 2>&1
Write-Host "Exit code: $LASTEXITCODE"
Write-Host "Output: $result2"
Write-Host ""

Write-Host "Test 3: With --json-schema (using splatting)" -ForegroundColor Yellow
$args3 = @('--print', '--model', 'haiku', '--output-format', 'json', '--json-schema', $schema, $prompt)
Write-Host "Args count: $($args3.Count)" -ForegroundColor Cyan
Write-Host "Last arg: $($args3[-1])" -ForegroundColor Cyan
$result3 = & claude @args3 2>&1
Write-Host "Exit code: $LASTEXITCODE"
Write-Host "Output type: $($result3.GetType().Name)"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    $result3 | ConvertTo-Json
} else {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host $result3
}
Write-Host ""

Write-Host "Test 4: With --json-schema (direct, no splatting)" -ForegroundColor Yellow
$result4 = & claude --print --model haiku --output-format json --json-schema $schema $prompt 2>&1
Write-Host "Exit code: $LASTEXITCODE"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    $result4 | ConvertTo-Json
} else {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host $result4
}
