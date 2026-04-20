package com.medi_connect.doctors_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class PrescriptionSchemaMigration {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    ApplicationRunner migratePrescriptionAppointmentIdColumn() {
        return args -> {
            String dataType = jdbcTemplate.query(
                    """
                    select data_type
                    from information_schema.columns
                    where table_schema = current_schema()
                      and table_name = 'prescription'
                      and column_name = 'appointment_id'
                    """
                    ,
                    rs -> rs.next() ? rs.getString("data_type") : null
            );

            if ("bigint".equalsIgnoreCase(dataType)) {
                jdbcTemplate.execute(
                        """
                        alter table prescription
                        alter column appointment_id type varchar(64)
                        using appointment_id::text
                        """
                );
            }
        };
    }
}
