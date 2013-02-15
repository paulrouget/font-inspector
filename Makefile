FILES = chrome/ \
				locale/ \
				bootstrap.js \
				chrome.manifest \
				install.rdf

all:
	rm -f fontinspector.xpi && zip -r fontinspector.xpi $(FILES)
	wget --post-file=$(PWD)/fontinspector.xpi http://localhost:8888/
