# Dev Log

## Oct 27, 2026
- Built Express server with /health route (Express 5, Node 24)
- Docker sandbox flags: --network none, --memory 128m, --cpus 0.5
- Attacks tested: network blocked, memory bomb killed (137), infinite loop killed (137)
- Bug found: plain timeout hung because PID 1 ignores signals; fixed with --init and timeout -s KILL
- Lesson: kill containers by name or ID, never all at once
