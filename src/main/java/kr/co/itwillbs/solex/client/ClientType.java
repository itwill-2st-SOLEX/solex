package kr.co.itwillbs.solex.client;

//Enum 예시
public enum ClientType {
 BUYER("구매처"),
 SELLER("판매처"),
 EQUIPMENT("설비");

 private final String label;

 ClientType(String label) {
     this.label = label;
 }

 public String getLabel() {
     return label;
 }
}