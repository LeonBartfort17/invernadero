package com.usco.invernadero.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

import java.util.List;
import java.util.Locale;

@Configuration
public class MessageConfig implements WebMvcConfigurer {

    /**
     * Lee los archivos messages_es.properties y messages_en.properties
     */
    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource source = new ResourceBundleMessageSource();
        source.setBasename("messages");           // busca messages_es, messages_en, etc.
        source.setDefaultEncoding("UTF-8");
        source.setUseCodeAsDefaultMessage(true);  // si no encuentra la clave, devuelve la clave misma
        return source;
    }

    /**
     * Detecta el idioma desde:
     *   1. El parámetro ?lang=es o ?lang=en en la URL
     *   2. El header Accept-Language del navegador
     * Por defecto usa español.
     */
    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setSupportedLocales(List.of(
                new Locale("es"),
                new Locale("en")
        ));
        resolver.setDefaultLocale(new Locale("es")); // español por defecto
        return resolver;
    }

    /**
     * Permite cambiar el idioma con ?lang=es o ?lang=en en cualquier endpoint
     */
    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");
        return interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }
}
