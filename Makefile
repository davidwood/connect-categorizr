all: build test

build:
	@ ./build.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha

.PHONY: build test
