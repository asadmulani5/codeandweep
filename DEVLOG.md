# Dev Log

## Oct 27, 2026
- Built Express server with /health route (Express 5, Node 24)
- Docker sandbox flags: --network none, --memory 128m, --cpus 0.5
- Attacks tested: network blocked, memory bomb killed (137), infinite loop killed (137)
- Bug found: plain timeout hung because PID 1 ignores signals; fixed with --init and timeout -s KILL
- Lesson: kill containers by name or ID, never all at once

## Nov 11, 2026
- Built runner.js: Node spawns Docker with sandbox flags, sends code via stdin
- Added POST /run endpoint with input validation (400 on bad input)
- Tested: print(2+3) returns 5; infinite loop killed at 5s (137)
- Learned: exit codes 0/1/125/137, command injection prevention, Promises

- Built judge.js: harness runs user function against tests in one container
- Random result marker blocks fake output; try/except per test
- Added GET /problems/:id (hides tests, shows 2 examples) and POST /submit
- Tested: correct Two Sum = accepted 4/4; cheat = wrong_answer 2/4
