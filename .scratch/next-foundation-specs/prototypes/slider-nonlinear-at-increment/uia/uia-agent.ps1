# PROTOTYPE -- UI Automation helper driven over stdin, one command per line:
#   read <marker>|<slider name>
#   set <marker>|<slider name>|<value>
# Reads RangeValuePattern properties and calls RangeValuePattern.SetValue, the
# platform path a UIA client (Narrator, a voice or switch tool) uses to change a slider.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$AE = [System.Windows.Automation.AutomationElement]
$cache = @{}

function Find-Slider([string]$marker, [string]$name) {
  $key = "$marker|$name"
  if ($cache.ContainsKey($key)) { return $cache[$key] }
  $win = $null
  foreach ($w in $AE::RootElement.FindAll([System.Windows.Automation.TreeScope]::Children, [System.Windows.Automation.Condition]::TrueCondition)) {
    if ($w.Current.Name -like "*$marker*") { $win = $w; break }
  }
  if ($null -eq $win) { throw "no window named like $marker" }
  $cond = New-Object System.Windows.Automation.AndCondition(
    (New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, [System.Windows.Automation.ControlType]::Slider)),
    (New-Object System.Windows.Automation.PropertyCondition($AE::NameProperty, $name)))
  $el = $win.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $cond)
  if ($null -eq $el) { throw "no slider named $name" }
  $cache[$key] = $el
  return $el
}

function Describe($el) {
  $p = $el.GetCurrentPattern([System.Windows.Automation.RangeValuePattern]::Pattern)
  $c = $p.Current
  return [ordered]@{ value = $c.Value; min = $c.Minimum; max = $c.Maximum; small = $c.SmallChange; large = $c.LargeChange; readOnly = $c.IsReadOnly; framework = $el.Current.FrameworkId }
}

[Console]::Out.WriteLine('READY')
[Console]::Out.WriteLine('<<END>>')
[Console]::Out.Flush()
while ($true) {
  $line = [Console]::In.ReadLine()
  if ($null -eq $line) { break }
  $parts = $line.Split(' ', 2)
  if ($parts[0] -eq 'reset') {
    $cache.Clear()
    [Console]::Out.WriteLine('{"reset":true}')
    [Console]::Out.WriteLine('<<END>>')
    [Console]::Out.Flush()
    continue
  }
  try {
    $a = $parts[1].Split('|')
    $el = Find-Slider $a[0] $a[1]
    if ($parts[0] -eq 'patterns') {
      $names = @($el.GetSupportedPatterns() | ForEach-Object { $_.ProgrammaticName })
      [Console]::Out.WriteLine((@{ patterns = ($names -join ','); framework = $el.Current.FrameworkId; rangeAvailable = $el.GetCurrentPropertyValue($AE::IsRangeValuePatternAvailableProperty) } | ConvertTo-Json -Compress))
      [Console]::Out.WriteLine('<<END>>')
      [Console]::Out.Flush()
      continue
    }
    if ($parts[0] -eq 'set') {
      $p = $el.GetCurrentPattern([System.Windows.Automation.RangeValuePattern]::Pattern)
      $p.SetValue([double]::Parse($a[2], [System.Globalization.CultureInfo]::InvariantCulture))
      Start-Sleep -Milliseconds 150
    }
    [Console]::Out.WriteLine((Describe $el | ConvertTo-Json -Compress))
  } catch {
    [Console]::Out.WriteLine((@{ error = $_.Exception.GetType().Name + ': ' + $_.Exception.Message } | ConvertTo-Json -Compress))
  }
  [Console]::Out.WriteLine('<<END>>')
  [Console]::Out.Flush()
}
