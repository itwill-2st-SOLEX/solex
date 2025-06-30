package kr.co.itwillbs.solex.sales;

//Enum 예시
public enum ClientType {
 client_cat_01("구매처"),
 client_cat_02("판매처"),
 client_cat_03("설비");

 private final String label;

 ClientType(String label) {
     this.label = label;
 }

 public String getLabel() {
     return label;
 }
}