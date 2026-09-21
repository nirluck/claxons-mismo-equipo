/* =========================================================================
   Mismo Equipo · configuración del cliente

   Van aquí las DOS cosas que son públicas por diseño:

     supabaseUrl  → Project Settings ▸ API ▸ Project URL
     supabaseKey  → Project Settings ▸ API Keys ▸ la llave "publishable"
                    (sb_publishable_...). Si tu proyecto todavía usa el
                    esquema viejo, sirve igual la "anon public" del
                    apartado Legacy API keys: las dos representan al rol
                    anon y las dos estan pensadas para vivir en el
                    navegador.

   NUNCA van aquí, ni en este repositorio:
     · la contraseña de la base de datos
     · la llave "secret" / "service_role"
   Cualquiera de esas dos salta el RLS y da acceso total a los datos.

   Lo que protege la base no es esconder esta llave, sino que el rol anon
   no tiene permiso sobre la tabla: solo puede ejecutar la función
   registrar_participacion(). Ver db/supabase.sql.
   ========================================================================= */

window.MISMO_EQUIPO = {
  supabaseUrl: "https://hjjyywqbaoprfodebjqf.supabase.co",
  supabaseKey: "sb_publishable_x60zSP-Pv3ohNUSPhT12IQ_2BuNnCzu"
};
