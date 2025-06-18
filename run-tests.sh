#!/bin/bash

# Red Mansion Community Testing Script
# This script provides convenient commands to run various test suites

echo "🏮 紅樓慧讀 - 社群功能測試運行器"
echo "================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo -e "${BLUE}使用方法:${NC}"
    echo -e "  ./run-tests.sh [選項]"
    echo ""
    echo -e "${BLUE}選項:${NC}"
    echo -e "  ${GREEN}all${NC}        運行所有測試"
    echo -e "  ${GREEN}community${NC}   只運行社群服務測試"
    echo -e "  ${GREEN}component${NC}   只運行 React 組件測試"
    echo -e "  ${GREEN}coverage${NC}    運行測試並生成覆蓋率報告"
    echo -e "  ${GREEN}watch${NC}       監控模式（開發時使用）"
    echo -e "  ${GREEN}install${NC}     安裝測試依賴"
    echo -e "  ${GREEN}clean${NC}       清理測試輸出和覆蓋率報告"
    echo -e "  ${GREEN}help${NC}        顯示此幫助信息"
    echo ""
    echo -e "${YELLOW}範例:${NC}"
    echo -e "  ./run-tests.sh all         # 運行所有測試"
    echo -e "  ./run-tests.sh community   # 只測試社群服務"
    echo -e "  ./run-tests.sh coverage    # 生成覆蓋率報告"
    echo ""
}

# Function to check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  未找到 node_modules，正在安裝依賴...${NC}"
        npm install
    fi
    
    # Check if Jest is installed
    if ! npm list jest >/dev/null 2>&1; then
        echo -e "${RED}❌ Jest 未安裝。請運行: ./run-tests.sh install${NC}"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 安裝測試依賴...${NC}"
    npm install --save-dev @types/jest jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
    echo -e "${GREEN}✅ 依賴安裝完成${NC}"
}

# Function to clean test outputs
clean_outputs() {
    echo -e "${YELLOW}🧹 清理測試輸出...${NC}"
    rm -rf test-output/
    rm -rf coverage/
    rm -rf .jest-cache/
    echo -e "${GREEN}✅ 清理完成${NC}"
}

# Function to run all tests
run_all_tests() {
    echo -e "${BLUE}🧪 運行所有測試...${NC}"
    npm run test
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 所有測試通過${NC}"
        show_test_output_location
    else
        echo -e "${RED}❌ 測試失敗${NC}"
        exit 1
    fi
}

# Function to run community service tests only
run_community_tests() {
    echo -e "${BLUE}🏘️  運行社群服務測試...${NC}"
    npm run test:community
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 社群服務測試通過${NC}"
        show_test_output_location
    else
        echo -e "${RED}❌ 社群服務測試失敗${NC}"
        exit 1
    fi
}

# Function to run component tests
run_component_tests() {
    echo -e "${BLUE}⚛️  運行 React 組件測試...${NC}"
    npm test -- --testPathPattern="tests/app/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 組件測試通過${NC}"
        show_test_output_location
    else
        echo -e "${RED}❌ 組件測試失敗${NC}"
        exit 1
    fi
}

# Function to run tests with coverage
run_coverage_tests() {
    echo -e "${BLUE}📊 運行測試並生成覆蓋率報告...${NC}"
    npm run test:coverage
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 測試完成，覆蓋率報告已生成${NC}"
        echo -e "${BLUE}📈 覆蓋率報告位置: coverage/lcov-report/index.html${NC}"
        show_test_output_location
    else
        echo -e "${RED}❌ 測試失敗${NC}"
        exit 1
    fi
}

# Function to run tests in watch mode
run_watch_tests() {
    echo -e "${BLUE}👀 啟動監控模式...${NC}"
    echo -e "${YELLOW}💡 提示: 按 'q' 退出監控模式${NC}"
    npm run test:watch
}

# Function to show test output location
show_test_output_location() {
    if [ -d "test-output" ]; then
        latest_output=$(ls -t test-output/ | head -n1)
        if [ ! -z "$latest_output" ]; then
            echo -e "${BLUE}📁 測試輸出位置: test-output/$latest_output${NC}"
            echo -e "${BLUE}📄 查看測試報告: test-output/$latest_output/test-summary.json${NC}"
        fi
    fi
}

# Main script logic
case "${1:-help}" in
    "all")
        check_dependencies
        run_all_tests
        ;;
    "community")
        check_dependencies
        run_community_tests
        ;;
    "component")
        check_dependencies
        run_component_tests
        ;;
    "coverage")
        check_dependencies
        run_coverage_tests
        ;;
    "watch")
        check_dependencies
        run_watch_tests
        ;;
    "install")
        install_dependencies
        ;;
    "clean")
        clean_outputs
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo -e "${RED}❌ 未知選項: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac 