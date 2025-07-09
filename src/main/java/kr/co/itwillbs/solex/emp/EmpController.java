package kr.co.itwillbs.solex.emp;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.extern.log4j.Log4j2;


@Controller
@RequestMapping("/emp")
public class EmpController {

	@GetMapping("/page")
	public String main(){

		return "emp/emp_main";
	}

}