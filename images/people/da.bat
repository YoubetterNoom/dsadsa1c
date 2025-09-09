@echo off
setlocal enabledelayedexpansion

:: 第一步：先把所有 .png 临时改名，避免冲突
set count=1
for %%f in (*.png) do (
    ren "%%f" "temp_!count!.tmp"
    set /a count+=1
)

:: 第二步：用自然排序（数值顺序）重新编号
set count=1
for /f "tokens=1* delims=" %%f in ('dir /b /a-d ^| findstr /r "temp_[0-9]*\.tmp" ^| sort /+6') do (
    ren "%%f" "!count!.png"
    set /a count+=1
)

echo 完成！已重新编号为 1.png, 2.png, ...
pause
