FROM vanbujm/moonbase-balena:v0.1.0
WORKDIR /usr/src/app
COPY . .
RUN OPENCV4NODEJS_DISABLE_AUTOBUILD=1 npm install
CMD ["/bin/bash", "start.sh"]