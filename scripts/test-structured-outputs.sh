#!/bin/bash
# Test script for structured outputs with gap analysis
# Run this OUTSIDE of Claude Code session to test CLI invocation

set -e  # Exit on error

echo "🧪 Testing Structured Outputs for Gap Analysis"
echo "=============================================="
echo ""

# Get current feature from git branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
FEATURE_DIR="specs/${BRANCH}"

if [ ! -d "$FEATURE_DIR" ]; then
  echo "❌ Error: Feature directory not found: $FEATURE_DIR"
  echo "   Current branch: $BRANCH"
  exit 1
fi

echo "✅ Feature detected: $BRANCH"
echo "📁 Feature directory: $FEATURE_DIR"
echo ""

# Minified JSON schema (from .claude/skills/analyze-report-gaps/SKILL.md)
SCHEMA='{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"feature_name":{"type":"string"},"analysis_date":{"type":"string","format":"date"},"analyst":{"type":"string","const":"Claude Haiku 4.5"},"method":{"type":"string","const":"6-pass cross-artifact consistency analysis"},"findings":{"type":"array","maxItems":50,"items":{"type":"object","properties":{"id":{"type":"string","pattern":"^[DAUCGI]\\d{2}$"},"category":{"type":"string","enum":["Duplication","Ambiguity","Underspecification","ConstitutionAlignment","CoverageGap","Inconsistency"]},"severity":{"type":"string","enum":["CRITICAL","HIGH","MEDIUM","LOW"]},"locations":{"type":"array","items":{"type":"string"}},"summary":{"type":"string"},"recommendation":{"type":"string"}},"required":["id","category","severity","locations","summary","recommendation"]}},"coverage_summary":{"type":"array","items":{"type":"object","properties":{"requirement_key":{"type":"string"},"has_task":{"type":"boolean"},"task_ids":{"type":"array","items":{"type":"string"}},"notes":{"type":"string"}},"required":["requirement_key","has_task","task_ids"]}},"constitution_issues":{"type":"array","items":{"type":"object","properties":{"principle":{"type":"string"},"violation":{"type":"string"},"location":{"type":"string"}},"required":["principle","violation","location"]}},"unmapped_tasks":{"type":"array","items":{"type":"object","properties":{"task_id":{"type":"string"},"description":{"type":"string"}},"required":["task_id","description"]}},"metrics":{"type":"object","properties":{"total_requirements":{"type":"integer","minimum":0},"total_tasks":{"type":"integer","minimum":0},"coverage_percentage":{"type":"number","minimum":0,"maximum":100},"ambiguity_count":{"type":"integer","minimum":0},"duplication_count":{"type":"integer","minimum":0},"critical_issues":{"type":"integer","minimum":0}},"required":["total_requirements","total_tasks","coverage_percentage","critical_issues"]},"next_actions":{"type":"array","items":{"type":"string"}}},"required":["feature_name","analysis_date","analyst","method","findings","metrics"]}'

echo "📋 Schema loaded ($(echo $SCHEMA | wc -c) bytes)"
echo ""

# Enable debug output in nested session
export DEBUG_ANALYSIS=1

echo "🚀 Invoking Claude CLI with structured outputs..."
echo "   Model: Haiku 4.5"
echo "   Permission mode: bypassPermissions"
echo "   Tools: default (all enabled)"
echo "   Debug: Enabled (check gap-analysis-debug.log)"
echo ""

# Invoke with permission flags
claude --print \
  --model haiku \
  --output-format json \
  --json-schema "$SCHEMA" \
  --permission-mode bypassPermissions \
  --tools "default" \
  "/analyze-report-gaps-haiku-4-5" \
  > "${FEATURE_DIR}/gap-analysis-cli-output.json" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ CLI invocation succeeded (exit code 0)"
  echo ""

  # Check if output file has content
  if [ -s "${FEATURE_DIR}/gap-analysis-cli-output.json" ]; then
    FILE_SIZE=$(wc -c < "${FEATURE_DIR}/gap-analysis-cli-output.json")
    echo "✅ Output file created: ${FEATURE_DIR}/gap-analysis-cli-output.json"
    echo "   Size: $FILE_SIZE bytes"
    echo ""

    # Extract structured_output field
    if command -v jq &> /dev/null; then
      echo "🔍 Extracting structured_output field..."
      jq '.structured_output' "${FEATURE_DIR}/gap-analysis-cli-output.json" \
        > "${FEATURE_DIR}/gap-analysis-report.json"

      if [ $? -eq 0 ]; then
        FINDINGS_COUNT=$(jq '.findings | length' "${FEATURE_DIR}/gap-analysis-report.json")
        CRITICAL_COUNT=$(jq '[.findings[] | select(.severity == "CRITICAL")] | length' "${FEATURE_DIR}/gap-analysis-report.json")

        echo "✅ Structured output extracted: ${FEATURE_DIR}/gap-analysis-report.json"
        echo ""
        echo "📊 Analysis Results:"
        echo "   Total findings: $FINDINGS_COUNT"
        echo "   Critical issues: $CRITICAL_COUNT"
        echo ""

        # Cleanup temp file
        rm "${FEATURE_DIR}/gap-analysis-cli-output.json"

        echo "🎉 Success! Structured outputs working correctly."
      else
        echo "❌ Failed to extract structured_output field"
        echo "   Raw output: ${FEATURE_DIR}/gap-analysis-cli-output.json"
        exit 1
      fi
    else
      echo "⚠️  jq not found - cannot extract structured_output field"
      echo "   Raw output: ${FEATURE_DIR}/gap-analysis-cli-output.json"
      echo "   Install jq to complete extraction"
    fi
  else
    echo "❌ Output file is empty"
    echo "   File: ${FEATURE_DIR}/gap-analysis-cli-output.json"
    exit 1
  fi
else
  echo "❌ CLI invocation failed (exit code $EXIT_CODE)"

  if [ -f "${FEATURE_DIR}/gap-analysis-cli-output.json" ]; then
    echo ""
    echo "📄 Error output:"
    cat "${FEATURE_DIR}/gap-analysis-cli-output.json"
  fi

  exit $EXIT_CODE
fi

# Check debug log if it exists
if [ -f "${FEATURE_DIR}/gap-analysis-debug.log" ]; then
  echo ""
  echo "📝 Debug log:"
  cat "${FEATURE_DIR}/gap-analysis-debug.log"
fi

echo ""
echo "✨ Test complete!"
