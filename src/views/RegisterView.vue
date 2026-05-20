async function handleRegister() {
  message.value = ''
  errorMessage.value = ''

  // 1. Crear usuario
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })

  if (error) {
    errorMessage.value = error.message
    return
  }

  // ⚠️ IMPORTANTE: a veces data.user viene null
  const user = data.user

  if (!user) {
    console.error('No user returned')
    return
  }

  console.log('USER ID:', user.id)

  // 2. Insertar perfil
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        name: email.value,
        role: 'parent'
      }
    ])

  if (profileError) {
    console.error('PROFILE ERROR:', profileError)
    errorMessage.value = profileError.message
    return
  }

  message.value = 'Usuario creado y perfil guardado 🎉'
}