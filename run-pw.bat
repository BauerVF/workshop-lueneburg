@echo off
cd /d c:\Develop\workshop-lueneburg\src\smart-powered-home
call npx playwright test --reporter=line
