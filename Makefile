default:	| setup build
setup: volume
	docker-compose -f docker-compose.builder.yml run --rm install
build:
	docker-compose -f docker-compose.builder.yml run --rm build
volume:
	docker volume create nodemodules_component
pack: 
	docker-compose -f docker-compose.builder.yml run --rm pack
enter: 
	docker-compose -f docker-compose.builder.yml run --rm enter
deploy:
	npm publish --access public
	
.PHONY: default setup build volume deploy