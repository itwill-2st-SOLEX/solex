package kr.co.itwillbs.solex.code;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Setter
public class CodeDTO {
	private String cod_id;
	private String cod_nm;
	private Character cod_yn;
	private LocalDate cod_reg_time;
}
