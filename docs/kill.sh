pkill -f "next dev" 2>/dev/null
sleep 2
rm -rf /Users/wanghu/work/study/test29/backend/.next
cd /Users/wanghu/work/study/test29/backend && nohup npm run dev > /tmp/backend.log 2>&1 &
sleep 8

 lsof -ti :3000 | xargs kill -9 2>/dev/null && echo "已停止 3000 端口服务" || echo "3000 端口无运行服务"