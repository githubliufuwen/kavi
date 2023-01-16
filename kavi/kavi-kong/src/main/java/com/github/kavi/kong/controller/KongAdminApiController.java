package com.github.kavi.kong.controller;

import com.github.kavi.kong.service.KongAdminApiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

/**
 * @Author liufuwen
 * @Date 2023/1/6 10:12
 * @describtion: handle admin api request.
 */

@RestController
@RequestMapping("/kong")
@Slf4j
public class KongAdminApiController {

    @Autowired
    private KongAdminApiService kongAdminApiService;

    @RequestMapping("/**")
    public ResponseEntity<Object> kong(HttpServletRequest request){
        log.info("uri:{}",request.getRequestURI());
        return kongAdminApiService.kong(request);

    }

}
