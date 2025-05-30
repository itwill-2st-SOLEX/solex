package kr.co.itwillbs.solex.Test;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Client {
	
	 private Long cli_id;           // CLI_ID
	 private Long emp_id;           // EMP_ID
	 private String cli_nm;         // CLI_NM
	 private String cli_type;       // CLI_TYPE
	 private String cli_phone;      // CLI_PHONE
	 private Long cli_pc;           // CLI_PC
	 private String cli_add;        // CLI_ADD
	 private String cli_da;         // CLI_DA
	 private String cli_ceo;        // CLI_CEO
	 private LocalDateTime cli_reg_date; // CLI_REG_DATE
	 private String cli_mgr_name;    // CLI_MGR_NAME
	 private String cli_mgr_phone;   // CLI_MGR_PHONE
	
	
}
