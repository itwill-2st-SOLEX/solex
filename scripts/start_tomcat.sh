#!/bin/bash
# 기존 WAR 파일 삭제
rm -f /usr/local/tomcat/webapps/SOLEX.war

# 새로운 WAR 파일 이동
mv /usr/local/tomcat/webapps/myapp.war /usr/local/tomcat/webapps/SOLEX.war

# Tomcat 재시작 (시스템에 따라 명령어가 다를 수 있음)
sudo systemctl restart tomcat