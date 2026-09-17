@echo off
title Servidor de Acesso no Celular - Orcamentos Marmoraria
cls
powershell -ExecutionPolicy Bypass -Command "& { `
  `$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*','Ethernet*' | Where-Object { `$_.IPAddress -notmatch '^(127\.|169\.254\.)' } | Select-Object -First 1).IPAddress; `
  if (-not `$ip) { `$ip = 'localhost'; } `
  `$port = 8080; `
  Write-Host '=====================================================' -ForegroundColor Cyan; `
  Write-Host '   SISTEMA DE ORÇAMENTOS - MARMORARIA (CELULAR/PC)   ' -ForegroundColor Yellow; `
  Write-Host '=====================================================' -ForegroundColor Cyan; `
  Write-Host ''; `
  Write-Host 'Para acessar no seu celular (conectado ao mesmo Wi-Fi):' -ForegroundColor Green; `
  Write-Host \"  http://`$(`$ip):`$(`$port)/\" -ForegroundColor White -BackgroundColor DarkBlue; `
  Write-Host ''; `
  Write-Host 'Para abrir no computador:' -ForegroundColor Gray; `
  Write-Host \"  http://localhost:`$(`$port)/\" -ForegroundColor Gray; `
  Write-Host ''; `
  Write-Host 'Pressione Ctrl+C para encerrar o servidor.' -ForegroundColor DarkYellow; `
  Write-Host '=====================================================' -ForegroundColor Cyan; `
  Start-Process \"http://localhost:`$(`$port)/\"; `
  `$listener = New-Object System.Net.HttpListener; `
  `$listener.Prefixes.Add(\"http://*:`$(`$port)/\"); `
  try { `$listener.Start(); } catch { `$listener.Prefixes.Clear(); `$listener.Prefixes.Add(\"http://localhost:`$(`$port)/\"); `$listener.Start(); } `
  `$dir = `$PSScriptRoot; `
  if (-not `$dir) { `$dir = Get-Location; } `
  while (`$listener.IsListening) { `
    `$context = `$listener.GetContext(); `
    [System.Threading.Tasks.Task]::Run({ `
      param(`$ctx, `$root) `
      `$req = `$ctx.Request; `
      `$resp = `$ctx.Response; `
      `$urlPath = `$req.Url.LocalPath.TrimStart('/'); `
      if ([string]::IsNullOrEmpty(`$urlPath)) { `$urlPath = 'index.html'; } `
      `$filePath = Join-Path `$root `$urlPath; `
      if (Test-Path `$filePath -PathType Leaf) { `
        `$bytes = [System.IO.File]::ReadAllBytes(`$filePath); `
        `$ext = [System.IO.Path]::GetExtension(`$filePath).ToLower(); `
        `$mime = switch (`$ext) { `
          '.html' { 'text/html; charset=utf-8' } `
          '.css'  { 'text/css' } `
          '.js'   { 'application/javascript' } `
          '.json' { 'application/json' } `
          '.png'  { 'image/png' } `
          '.jpg'  { 'image/jpeg' } `
          '.svg'  { 'image/svg+xml' } `
          '.apk'  { 'application/vnd.android.package-archive' } `
          default { 'application/octet-stream' } `
        }; `
        `$resp.ContentType = `$mime; `
        `$resp.ContentLength64 = `$bytes.Length; `
        `$resp.OutputStream.Write(`$bytes, 0, `$bytes.Length); `
      } else { `
        `$resp.StatusCode = 404; `
      } `
      `$resp.OutputStream.Close(); `
    }.GetNewClosure(), `$context, `$dir); `
  } `
}"
pause
