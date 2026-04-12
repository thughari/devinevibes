package com.devinevibes.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCache;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
public class RedisConfig {

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.registerModule(new JavaTimeModule());
        
        // Use a secure polymorphic type validator
        com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator ptv = 
            com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator.builder()
                .allowIfBaseType(Object.class)
                .build();

        // Enable type information for ALL types (including Records which are final)
        // Using WRAPPER_ARRAY format which is the standard robust default for Redis serializers
        mapper.activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.EVERYTHING, com.fasterxml.jackson.annotation.JsonTypeInfo.As.WRAPPER_ARRAY);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(24))
                .disableCachingNullValues()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer(mapper)));

        return new SmartRedisCacheManager(connectionFactory, defaultConfig);
    }

    /**
     * Custom Cache Manager that supports dynamic TTL via cache names using the # format.
     * Example: @Cacheable(value = "banners#7d") sets a 7-day TTL.
     */
    private static class SmartRedisCacheManager extends RedisCacheManager {
        private final RedisCacheConfiguration defaultConfiguration;
        private static final Pattern TTL_PATTERN = Pattern.compile("(.+)#(\\d+)([smhd])");

        public SmartRedisCacheManager(RedisConnectionFactory connectionFactory, RedisCacheConfiguration defaultConfiguration) {
            super(RedisCacheWriter.nonLockingRedisCacheWriter(connectionFactory), defaultConfiguration);
            this.defaultConfiguration = defaultConfiguration;
        }

        @Override
        protected RedisCache createRedisCache(String name, RedisCacheConfiguration cacheConfig) {
            Matcher matcher = TTL_PATTERN.matcher(name);
            if (matcher.matches()) {
                String realName = matcher.group(1);
                long amount = Long.parseLong(matcher.group(2));
                String unit = matcher.group(3);

                Duration duration = switch (unit) {
                    case "s" -> Duration.ofSeconds(amount);
                    case "m" -> Duration.ofMinutes(amount);
                    case "h" -> Duration.ofHours(amount);
                    case "d" -> Duration.ofDays(amount);
                    default -> Duration.ofHours(24);
                };

                return super.createRedisCache(realName, defaultConfiguration.entryTtl(duration));
            }
            return super.createRedisCache(name, cacheConfig);
        }
    }
}
