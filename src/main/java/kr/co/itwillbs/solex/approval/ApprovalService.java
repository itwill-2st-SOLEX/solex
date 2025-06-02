package kr.co.itwillbs.solex.approval;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApprovalService {
	
	private final ApprovalMapper approvalMapper;

	public List<Map<String, String>> get() {
		return approvalMapper.selectApprovalList();
	}
	
}
