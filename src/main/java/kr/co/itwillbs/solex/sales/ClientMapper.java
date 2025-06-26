package kr.co.itwillbs.solex.sales;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ClientMapper {
	
	List<Map<String, Object>> getClientNameList();

	List<Map<String, Object>> selectClients(Map<String, Object> params);

	int createClients(Map<String , Object>param);

	Map<String, Object> getClientById(int clientId);

	int updateClient(Map<String, Object> param);

	List<Map<String, Object>> getSearchClients(Map<String, Object> keyword);

}
