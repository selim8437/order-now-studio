@echo off
rem ── OrderNow Studio launcher ─────────────────────────────────
rem Opens the studio in an app-style window (no tabs / address bar)
rem using Edge or Chrome, falling back to the default browser.
setlocal
set "DIR=%~dp0"
set "URL=file:///%DIR%index.html"
set "URL=%URL:\=/%"

set "EDGE1=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE2=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "CHROME1=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME2=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if exist "%EDGE1%"   start "" "%EDGE1%"   --app="%URL%" --window-size=1280,860 && goto :eof
if exist "%EDGE2%"   start "" "%EDGE2%"   --app="%URL%" --window-size=1280,860 && goto :eof
if exist "%CHROME1%" start "" "%CHROME1%" --app="%URL%" --window-size=1280,860 && goto :eof
if exist "%CHROME2%" start "" "%CHROME2%" --app="%URL%" --window-size=1280,860 && goto :eof

rem Fallback: default browser (opens as a normal tab)
start "" "%DIR%index.html"
goto :eof
