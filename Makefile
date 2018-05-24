install:
	@yarn install
	@yarn lerna bootstrap
	@make install-flow-typed

babel-clean:
	@rm -rf ./lib ./packages/**/lib

babel:
	@make babel-clean
	@yarn babel
	@yarn lerna run babel

install-flow-typed:
	@make babel
	@for package in $$(node ./lib/findPackages); do \
		yarn flow-typed install -p ./packages/$$package --verbose; \
	done
	@make babel-clean

flow:
	@yarn lerna run babel --scope cat-utils
	@./node_modules/.bin/flow

lint:
	@yarn lerna run babel --scope eslint-config-cat
	@yarn lerna run lint

clean:
	@make babel-clean
	@rm -rf ./node_modules ./packages/**/node_modules
	@rm -rf flow-typed