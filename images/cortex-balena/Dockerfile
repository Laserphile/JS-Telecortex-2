FROM vanbujm/moonbase-balena:v0.1.0
WORKDIR /usr/src/app
COPY . .
RUN git clone https://github.com/Laserphile/JS-Telecortex-2
RUN cd JS-Telecortex-2 && OPENCV4NODEJS_DISABLE_AUTOBUILD=1 npm install --loglevel info
CMD ["/bin/bash", "start.sh"]