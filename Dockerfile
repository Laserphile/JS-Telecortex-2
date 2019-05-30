FROM vanbujm/moonbase-balena:v0.1.0
WORKDIR /usr/src/app
COPY . .
RUN ls build
CMD ["/bin/bash", "start.sh"]
