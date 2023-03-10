package com.github.kavi.kong.service;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpUtil;
import com.github.kavi.result.ReturnEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.yaml.snakeyaml.util.UriEncoder;

import javax.servlet.UnavailableException;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.util.*;

/**
 * @Author liufuwen
 * @Date 2023/1/6 10:20
 * @describtion:
 */

@Service
@Slf4j
public class KongAdminApiService {

    @Autowired
    private RestTemplate restTemplate;

    private String kongHost = "http://10.248.190.138:8001";

    private String stripPath = "/kavi/kong";


    public ResponseEntity<Object> kong(HttpServletRequest request){

        String uri = request.getRequestURI();
        uri = handleUri(uri);
        String method = request.getMethod();
        Map<String, String[]> parameterMap = request.getParameterMap();
         //copy params,has query and body form data.
        MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
        Set<String> keySet = parameterMap.keySet();
        for (String key : keySet) {
            String[] value = parameterMap.get(key);
            params.add(key, value[0]);
        }
        //获取query参数
        Map<String, String> query = parseQuery(request);
        removeRepeatParam(parameterMap,query);
        //复制请求头
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            String value = request.getHeader(name);
            headers.add(name, value);
        }
        //读取body
        Object body = buildBody(request, params);
        //转发 body可以为空
        HttpEntity<Object> httpEntity = new HttpEntity<>(body, headers);
        URI destURI = buildURI(query,kongHost + uri);
        HttpMethod httpMethod = HttpMethod.resolve(method);
        try {
            ResponseEntity<Object> res = doForward(destURI, httpMethod, httpEntity);
            return res;
        } catch (Throwable e) {
            if(e instanceof HttpStatusCodeException){
                HttpStatusCodeException hse = (HttpStatusCodeException)e;
                HttpStatus status = ((HttpStatusCodeException) e).getStatusCode();
                return ResponseEntity.status(status)
                        .body(hse.getResponseBodyAsString());
            }
            return ResponseEntity.status(500)
                    .body(ReturnEntity.error("kong node admin api unreachable."));
        }
    }

    private String handleUri(String uri){
        if(uri.equals(stripPath)){
            return "/";
        }
        return uri.substring(stripPath.length());
    }

    private void removeRepeatParam(Map<String, String[]> parameterMap,Map<String, String> query){

        List<String> queryInParam = new ArrayList<>();

        Set<String> paramKeys = parameterMap.keySet();
        query.forEach((k,v)->{
            for(String key:paramKeys){
                if(k.equals(key)){
                    queryInParam.add(k);
                }
            }
        });

        if(queryInParam.size()==0){
            return;
        }
        //delete query param in paramMap
        queryInParam.forEach(k->parameterMap.remove(k));
    }

    private Map<String,String> parseQuery(HttpServletRequest request) {

        Map<String,String> query = new HashMap<>();
        String querystring = request.getQueryString();
        if(StrUtil.isBlank(querystring)){
            return query;
        }
        try {
            querystring = URLDecoder.decode(querystring,"utf-8");
        } catch (UnsupportedEncodingException e) {
             log.error("UnsupportedEncodingException",e);
        }
        query = HttpUtil.decodeParamMap(querystring, Charset.defaultCharset());
        return query;
    }

    private URI buildURI(Map<String, String> query, String path) {

        //1拼接参数
        StringBuilder sb = new StringBuilder();
        Set<String> keys = query.keySet();
        for(String key:keys){
            sb.append(key);
            sb.append("=");
            sb.append(query.get(key));
            sb.append("&");
        }
        URI uri = null;
        try {
            if(sb.length()==0){
               uri = new URI(path);
                return uri;
            }
            if(sb.length()>0){
                sb.deleteCharAt(sb.length()-1);
            }
            //参数编码
            String parameters = UriEncoder.encode(sb.toString());
            String destPath = path+"?"+parameters;
            uri = new URI(destPath);
        } catch (Exception e) {
           log.error("uri error",e);
        }
        return  uri;
    }


    private Object buildBody(HttpServletRequest request, MultiValueMap<String, Object> params) {

        String contentType = request.getContentType();
        if(StrUtil.isBlank(contentType)){
            return null;
        }
        if(contentType.contains("urlencoded") || contentType.contains("form-data")){
            return params;
        }
        byte[] body = null;
        try {
            InputStream in = request.getInputStream();
            if(in!=null && in.available()>0){
                body = new byte[in.available()];
                in.read(body);
            }
        } catch (Exception e) {
            log.error("read body error",e);
        }
        return body;
    }


    private ResponseEntity doForward(URI uri, HttpMethod method, HttpEntity httpEntity) throws Throwable {
        log.info("forward start:URI:{},method:{},entity:{}",uri,method,httpEntity);
        ResponseEntity<String> res = restTemplate.exchange(uri, method, httpEntity, String.class);
        log.info("result:{}",res.getStatusCode());
        return res;

    }
}
