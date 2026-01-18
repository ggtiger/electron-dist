#!/bin/bash

# ============================================
# 前后端部署脚本
# 项目: Electron App 分发管理系统
# 前端: Vue3 + Vite
# 后端: Next.js + Prisma + MySQL
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
FRONTEND_DIR="$PROJECT_ROOT/admin-frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# 默认配置
DEPLOY_ENV=${DEPLOY_ENV:-"production"}
BACKEND_PORT=${BACKEND_PORT:-3000}
FRONTEND_DIST_DIR="$FRONTEND_DIR/dist"

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_step "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js (推荐 v18+)"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_warn "Node.js 版本低于 18，建议升级"
    fi
    
    log_info "Node.js: $(node -v)"
    log_info "npm: $(npm -v)"
}

# 构建前端
build_frontend() {
    log_step "构建前端项目..."
    
    cd "$FRONTEND_DIR"
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm install --legacy-peer-deps
    
    # 构建生产版本
    log_info "构建前端生产版本..."
    npm run build
    
    if [ -d "$FRONTEND_DIST_DIR" ]; then
        log_info "前端构建完成: $FRONTEND_DIST_DIR"
    else
        log_error "前端构建失败"
        exit 1
    fi
}

# 构建后端
build_backend() {
    log_step "构建后端项目..."
    
    cd "$BACKEND_DIR"
    
    # 安装依赖
    log_info "安装后端依赖..."
    npm install
    
    # 生成 Prisma Client
    log_info "生成 Prisma Client..."
    npx prisma generate
    
    # 构建 Next.js
    log_info "构建 Next.js 生产版本..."
    npm run build
    
    log_info "后端构建完成"
}

# 数据库迁移
migrate_database() {
    log_step "执行数据库迁移..."
    
    cd "$BACKEND_DIR"
    
    # 执行迁移
    npx prisma migrate deploy
    
    log_info "数据库迁移完成"
}

# 启动后端服务
start_backend() {
    log_step "启动后端服务..."
    
    cd "$BACKEND_DIR"
    
    # 检查是否已有进程在运行
    if lsof -i:$BACKEND_PORT &> /dev/null; then
        log_warn "端口 $BACKEND_PORT 已被占用，尝试停止旧进程..."
        kill $(lsof -t -i:$BACKEND_PORT) 2>/dev/null || true
        sleep 2
    fi
    
    # 使用 PM2 启动（如果安装）或直接后台运行
    if command -v pm2 &> /dev/null; then
        pm2 delete backend 2>/dev/null || true
        pm2 start npm --name "backend" -- start
        log_info "后端服务已通过 PM2 启动"
    else
        nohup npm start > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
        log_info "后端服务已后台启动，日志: $PROJECT_ROOT/logs/backend.log"
    fi
}

# 停止服务
stop_services() {
    log_step "停止服务..."
    
    if command -v pm2 &> /dev/null; then
        pm2 delete backend 2>/dev/null || true
    fi
    
    if lsof -i:$BACKEND_PORT &> /dev/null; then
        kill $(lsof -t -i:$BACKEND_PORT) 2>/dev/null || true
    fi
    
    log_info "服务已停止"
}

# 创建必要目录
setup_directories() {
    log_step "创建必要目录..."
    
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$BACKEND_DIR/uploads"
    
    log_info "目录创建完成"
}

# 生成生产环境配置
generate_env_files() {
    log_step "检查环境配置..."
    
    # 后端环境配置
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        log_warn "后端 .env 文件不存在，请创建并配置数据库连接"
        cat > "$BACKEND_DIR/.env.example" << 'EOF'
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# Storage
LOCAL_UPLOAD_DIR="./uploads"

# Server
BASE_URL="http://your-domain.com:3000"
EOF
        log_info "已创建 .env.example 模板"
    fi
    
    # 前端环境配置
    if [ ! -f "$FRONTEND_DIR/.env.production" ]; then
        log_warn "前端 .env.production 文件不存在"
        cat > "$FRONTEND_DIR/.env.production.example" << 'EOF'
VITE_API_BASE_URL=http://your-domain.com:3000/api
EOF
        log_info "已创建 .env.production.example 模板"
    fi
}

# 健康检查
health_check() {
    log_step "执行健康检查..."
    
    sleep 3
    
    # 检查后端服务
    if curl -s "http://localhost:$BACKEND_PORT/api/apps" > /dev/null 2>&1; then
        log_info "后端服务运行正常"
    else
        log_warn "后端服务可能未正常启动，请检查日志"
    fi
}

# 打印部署信息
print_deploy_info() {
    echo ""
    echo "============================================"
    echo -e "${GREEN}部署完成！${NC}"
    echo "============================================"
    echo ""
    echo "后端服务: http://localhost:$BACKEND_PORT"
    echo "API 地址: http://localhost:$BACKEND_PORT/api"
    echo ""
    echo "前端静态文件: $FRONTEND_DIST_DIR"
    echo "（需要配置 Nginx 或其他 Web 服务器托管）"
    echo ""
    echo "============================================"
}

# 完整部署
deploy_all() {
    log_info "开始完整部署..."
    
    check_dependencies
    setup_directories
    generate_env_files
    build_frontend
    build_backend
    migrate_database
    start_backend
    health_check
    print_deploy_info
}

# 仅构建
build_only() {
    log_info "仅执行构建..."
    
    check_dependencies
    build_frontend
    build_backend
    
    log_info "构建完成"
}

# 显示帮助
show_help() {
    echo "使用方法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  deploy      完整部署（构建 + 迁移 + 启动）"
    echo "  build       仅构建前后端"
    echo "  frontend    仅构建前端"
    echo "  backend     仅构建后端"
    echo "  migrate     仅执行数据库迁移"
    echo "  start       启动后端服务"
    echo "  stop        停止服务"
    echo "  restart     重启服务"
    echo "  help        显示帮助"
    echo ""
    echo "环境变量:"
    echo "  DEPLOY_ENV    部署环境 (默认: production)"
    echo "  BACKEND_PORT  后端端口 (默认: 3000)"
}

# 主函数
main() {
    case "${1:-deploy}" in
        deploy)
            deploy_all
            ;;
        build)
            build_only
            ;;
        frontend)
            check_dependencies
            build_frontend
            ;;
        backend)
            check_dependencies
            build_backend
            ;;
        migrate)
            migrate_database
            ;;
        start)
            start_backend
            health_check
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            sleep 2
            start_backend
            health_check
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
