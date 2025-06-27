package kr.co.itwillbs.solex.material;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class MaterialService {

	@Autowired
	private MaterialMapper materialMapper;
	
	public List<Map<String, Object>> getMeterialNameList() {
		// TODO Auto-generated method stub
		return materialMapper.getMeterialNameList();
	}

	//자재 목록
	public List<Map<String, Object>> getMaterial() {
		
		return materialMapper.getMaterial();
	}
	
	//자재 무한스크롤
	public List<Map<String, Object>> getMaterialList(int offset, int size) {
		// TODO Auto-generated method stub
		List<Map<String, Object>> list = materialMapper.getMaterialList(offset, size);
		return list;
	}
	
	// 자재 단위 가져오기 (자재등록에서 select)
	public List<Map<String, Object>> getMatUnits() {
		 return materialMapper.getMatUnits();
	}

	//자재 등록 
	public int registerMat(Map<String, Object> matMap) {
		System.out.println("service mat map = " + matMap);
		return materialMapper.registMat(matMap);
	}

	
	//toast ui grid 수정 (=자재 수정) 
	public void updateGridCell(Map<String, Object> payload) {
		materialMapper.updateGridCell(payload);
	}

}
