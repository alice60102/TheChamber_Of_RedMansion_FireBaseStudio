@echo off
echo ================================================================
echo Dynamic Data Loading Test Suite for Windows
echo ================================================================
echo.
echo Starting tests...

echo.
echo [1/3] Running Knowledge Graph Utils Tests...
echo ----------------------------------------------------------------
call npx jest tests/lib/knowledgeGraphUtils.test.ts --coverage --verbose

echo.
echo [2/3] Running Graph Route API Tests...
echo ----------------------------------------------------------------
call npx jest tests/app/api/chapters/graph-route.test.ts --coverage --verbose

echo.
echo [3/3] Running KnowledgeGraphViewer Dynamic Loading Tests...
echo ----------------------------------------------------------------
call npx jest tests/components/KnowledgeGraphViewer-dynamic-loading.test.tsx --coverage --verbose

echo.
echo ================================================================
echo Test suite completed!
echo ================================================================
pause 