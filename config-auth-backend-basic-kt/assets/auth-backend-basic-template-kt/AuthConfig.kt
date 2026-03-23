package com.example.modules.auth

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration

@Configuration
@ComponentScan(basePackageClasses = [AuthConfig::class])
class AuthConfig
