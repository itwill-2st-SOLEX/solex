package kr.co.itwillbs.solex.code;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CodeDTO {
	private String cod_id;
	private String cod_nm;
	private Character cod_yn;
	private Date cod_reg_time;
	
	@Override
	public String toString() {
	    return "CodeDTO{" +
	           "cod_id='" + cod_id + '\'' +
	           ", cod_nm='" + cod_nm + '\'' +
	           ", cod_yn=" + cod_yn +
	           ", cod_reg_time=" + cod_reg_time +
	           '}';
	}
}