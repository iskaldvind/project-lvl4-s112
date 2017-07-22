install: install-deps install-flow-typed

console:
	npm run gulp console

init:
	npm run gulp init

start:
	DEBUG="app:*" npm run nodemon -- --watch src --ext '.js,.pug' --exec npm run gulp server

install-deps:
	yarn

install-typed:
	npm run flow-typed install

build:
	rm -rf dist
	npm run build

test: init
	NODE_ENV=test npm test

check-types:
	npm run flow

lint:
	npm run eslint -- src __tests__

publish:
	npm publish

deploy:
	npm --no-git-tag-version version patch
	git add .
	git commit -m 'and again'
	git push
	git push heroku master

.PHONY: test
