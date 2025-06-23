# Changelog

## [0.8.0](https://github.com/koki-develop/claude-code-team/compare/v0.7.0...v0.8.0) (2025-06-23)


### Features

* Add stop command to cleanly terminate Claude Code Team sessions ([7978827](https://github.com/koki-develop/claude-code-team/commit/79788275e161d81fcc8786a283434d5edc9b4645))


### Bug Fixes

* Remove messages delete command ([a84c1c5](https://github.com/koki-develop/claude-code-team/commit/a84c1c596583fcf9469a58b6f360cb7d0860a823))

## [0.7.0](https://github.com/koki-develop/claude-code-team/compare/v0.6.0...v0.7.0) (2025-06-21)


### ⚠ BREAKING CHANGES

* The send command now requires both --from and --to flags
    - Before: npx ccteam@latest agent send --to <role> <message>
    - After: npx ccteam@latest agent send --from <role> --to <role> <message>
* The send command now requires --to flag instead of positional argument
    - Before: npx ccteam@latest agent send <role> <message>
    - After: npx ccteam@latest agent send --to <role> <message>

### Features

* Add required --from flag to send command and remove getCurrentRole ([31d5a2f](https://github.com/koki-develop/claude-code-team/commit/31d5a2f06d9e03e538242e1b99d89b6e29da708e))
* Change send command to use --to flag for recipient ([b10e9cb](https://github.com/koki-develop/claude-code-team/commit/b10e9cb3e66cac05144a1fff4031b4cb30d324f6))
* Release ([1dab860](https://github.com/koki-develop/claude-code-team/commit/1dab860a33f53f9c708cc3e43a2c518f56cd65e5))

## [0.6.0](https://github.com/koki-develop/claude-code-team/compare/v0.5.0...v0.6.0) (2025-06-21)


### Features

* add tmux installation check on start command ([#17](https://github.com/koki-develop/claude-code-team/issues/17)) ([b6922b4](https://github.com/koki-develop/claude-code-team/commit/b6922b4e1fe1739884626b3b665858b4bf50fc41))
* enhance error handling throughout the codebase ([7664474](https://github.com/koki-develop/claude-code-team/commit/766447468405d41da6d105d8f638d4e9944afa33))
* enhance tmux message sending with role-based prefixes ([fd783d0](https://github.com/koki-develop/claude-code-team/commit/fd783d0922ae4b7175d5c3b9000f64deefff0705))
* implement comprehensive error handling system ([668f0a2](https://github.com/koki-develop/claude-code-team/commit/668f0a2ab486844d8425ca8dec1d3680c54699cd))


### Bug Fixes

* Fix send command ([89025ab](https://github.com/koki-develop/claude-code-team/commit/89025ab140b51312396336f7360a57be69164f2a))
* Update instructions ([a3bca00](https://github.com/koki-develop/claude-code-team/commit/a3bca00f68c3a8b339a87ba343403106b9562ad2))
* Update instructions ([0dd79dc](https://github.com/koki-develop/claude-code-team/commit/0dd79dc46878476d8159b1712002fc5da85ee914))

## [0.5.0](https://github.com/koki-develop/claude-code-team/compare/v0.4.0...v0.5.0) (2025-06-19)


### Features

* add tool configuration support for role-specific Claude Code tool restrictions ([#14](https://github.com/koki-develop/claude-code-team/issues/14)) ([9782401](https://github.com/koki-develop/claude-code-team/commit/9782401625bb3d99985f5d4cd1488f6395d0abd7))
* Enhance CLI output with styling and tool configuration support ([#16](https://github.com/koki-develop/claude-code-team/issues/16)) ([4664ae7](https://github.com/koki-develop/claude-code-team/commit/4664ae71da74004a7220f8b2be8727b142d604ff))

## [0.4.0](https://github.com/koki-develop/claude-code-team/compare/v0.3.0...v0.4.0) (2025-06-18)


### Features

* add agent subcommand to organize agent-specific commands ([#12](https://github.com/koki-develop/claude-code-team/issues/12)) ([8d82f7a](https://github.com/koki-develop/claude-code-team/commit/8d82f7a23780f70b168a2a6930cc69408f0ad31d))
* add CLI flags for role-specific model and permission settings ([#9](https://github.com/koki-develop/claude-code-team/issues/9)) ([7bf5ec9](https://github.com/koki-develop/claude-code-team/commit/7bf5ec9a41be1089a1b76b428ce7d7bb76e6b466))

## [0.3.0](https://github.com/koki-develop/claude-code-team/compare/v0.2.0...v0.3.0) (2025-06-18)


### Features

* add --config option to start command ([4dce488](https://github.com/koki-develop/claude-code-team/commit/4dce488d1d0b0c8c9268dc90580b9bc9a6096456))
* add configuration file support ([a80b656](https://github.com/koki-develop/claude-code-team/commit/a80b6566db805451b3776982d92cfdae64eeb62e))
* add init command for configuration file creation ([f411bd5](https://github.com/koki-develop/claude-code-team/commit/f411bd58c249b78e69e1f861ebb7192004dedceb))
* integrate configuration with start command ([4a0a52e](https://github.com/koki-develop/claude-code-team/commit/4a0a52ea45c86241487c59a664faa619ad9eb3dd))

## [0.2.0](https://github.com/koki-develop/claude-code-team/compare/v0.1.1...v0.2.0) (2025-06-18)


### Features

* add --version flag to CLI ([8b20977](https://github.com/koki-develop/claude-code-team/commit/8b20977b4290029da3fc509c59c9e9fb25d0bbd9))


### Bug Fixes

* Fix instruction path ([f789c85](https://github.com/koki-develop/claude-code-team/commit/f789c858f425191fbe9affc436d14d1de9a5d300))

## [0.1.1](https://github.com/koki-develop/claude-code-team/compare/v0.1.0...v0.1.1) (2025-06-18)


### Bug Fixes

* Fix instructions ([fbdeb15](https://github.com/koki-develop/claude-code-team/commit/fbdeb15aabc6f3b5bf8518d9e110c11295fa1781))

## [0.1.0](https://github.com/koki-develop/claude-code-team/compare/v0.0.5...v0.1.0) (2025-06-18)


### Features

* implement session-based message directory separation ([1bf9863](https://github.com/koki-develop/claude-code-team/commit/1bf986326298d4fa8f5f98dc2eb805305893b20c))

## [0.0.5](https://github.com/koki-develop/claude-code-team/compare/v0.0.4...v0.0.5) (2025-06-18)


### Bug Fixes

* ccteam -&gt; Claude Code Team ([f905258](https://github.com/koki-develop/claude-code-team/commit/f905258441f5ea21befe7279c149b99e189e7ce6))
* Fix manager instruction ([cd11d37](https://github.com/koki-develop/claude-code-team/commit/cd11d37f33c9f75128f863a23e0428355206c3cf))

## [0.0.4](https://github.com/koki-develop/claude-code-team/compare/v0.0.3...v0.0.4) (2025-06-18)


### Bug Fixes

* bun run ./src/main.ts -&gt; npx ccteam@latest ([e3a4f2d](https://github.com/koki-develop/claude-code-team/commit/e3a4f2d25ed3e850b238b20f7fe23d123cbb3ed6))
* Fix load session name ([325b6ec](https://github.com/koki-develop/claude-code-team/commit/325b6ec20d00f61e69c6f50b5fc8401bdbd881be))

## [0.0.3](https://github.com/koki-develop/claude-code-team/compare/v0.0.2...v0.0.3) (2025-06-18)


### Bug Fixes

* Fix build script ([c43e826](https://github.com/koki-develop/claude-code-team/commit/c43e8263a9b502417f753bed35e848fa6c474663))

## 0.0.2 (2025-06-18)


### Features

* Add dynamic session name generation and management ([57b1cbb](https://github.com/koki-develop/claude-code-team/commit/57b1cbb67a2b79ffca5984700543c57c68d9f838))
* Add sleep utility function for asynchronous delays ([6b2cbe0](https://github.com/koki-develop/claude-code-team/commit/6b2cbe0a4369d02e5f81a5518c64441059804f75))
* Add tmux wrapper function for process management ([5386691](https://github.com/koki-develop/claude-code-team/commit/5386691423bc9cd15ff79cb41ab795b104186ee5))
* Enhance CLI command feedback and user experience ([d8d512e](https://github.com/koki-develop/claude-code-team/commit/d8d512e4edf741a1b958129a765a2a5a425503f9))
* Implement commands ([0103e11](https://github.com/koki-develop/claude-code-team/commit/0103e11de82a3791076a1f070714b57fdfd7d703))
* Improve CLI command descriptions ([9933556](https://github.com/koki-develop/claude-code-team/commit/9933556f25f8d3114609048e9f47968b8c051d20))
* Release ([dea3c6b](https://github.com/koki-develop/claude-code-team/commit/dea3c6bca84fe100d16807cc45d6c2fb49c86666))


### Bug Fixes

* reviewer -&gt; leader ([9deee27](https://github.com/koki-develop/claude-code-team/commit/9deee27e5aa47623520738f730c8e04fa49fef26))
