FROM balenalib/armv7hf-debian-node:10.15-latest-build
WORKDIR /usr/src/app
COPY . .

RUN [ "cross-build-start" ]
RUN sudo apt-get update && sudo apt-get upgrade
RUN sudo apt-get install zip \
      apt-transport-https \
      unzip \
      screen
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN sudo apt-get update && apt-get install yarn

RUN sudo apt-get -y update
RUN sudo apt-get install -y build-essential cmake
RUN sudo apt-get install -y qt5-default libvtk6-dev
RUN sudo apt-get install -y zlib1g-dev libjpeg-dev libwebp-dev libpng-dev libtiff5-dev libjasper-dev libopenexr-dev libgdal-dev
RUN sudo apt-get install -y libdc1394-22-dev libavcodec-dev libavformat-dev libswscale-dev libtheora-dev libvorbis-dev libxvidcore-dev libx264-dev yasm libopencore-amrnb-dev libopencore-amrwb-dev libv4l-dev libxine2-dev
RUN sudo apt-get install -y libtbb-dev libeigen3-dev
RUN sudo apt-get install -y python-dev python-tk python-numpy python3-dev python3-tk python3-numpy
RUN sudo apt-get install -y ant default-jdk
RUN sudo apt-get install -y doxygen
RUN sudo apt-get install -y unzip wget
RUN wget https://github.com/opencv/opencv/archive/3.4.2.zip
RUN unzip 3.4.2.zip
RUN rm 3.4.2.zip
RUN mv opencv-3.4.2 OpenCV
RUN cd OpenCV
RUN mkdir build
RUN cd build
RUN cmake -DWITH_QT=ON -DWITH_OPENGL=ON -DFORCE_VTK=ON -DWITH_TBB=ON -DWITH_GDAL=ON -DWITH_XINE=ON -DBUILD_EXAMPLES=ON -DENABLE_PRECOMPILED_HEADERS=OFF ..
RUN make -j4
RUN make install
RUN ldconfig

RUN [ "cross-build-end" ]

CMD ["/bin/bash"]