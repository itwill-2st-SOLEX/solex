package kr.co.itwillbs.solex.code;

import java.time.LocalDateTime;

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
	private String COD_ID;
	private String COD_NM;
	private Character COD_YN;
	private LocalDateTime COD_REG_TIME;
}
