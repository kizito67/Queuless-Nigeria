function Button({ text, onClick, variant = 'primary', type = 'button', fullWidth = false, small = false }) {
  const base = `inline-flex items-center justify-center rounded-full font-semibold border-[1.5px] transition active:scale-95 disabled:opacity-50 ${
    small ? 'px-4 py-2 text-sm' : 'px-5 py-3 text-[15px]'
  }`
  const variants = {
    primary: 'bg-forest text-white border-transparent hover:bg-forest-light',
    ghost: 'bg-transparent border-line-strong text-ink hover:border-forest hover:text-forest',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
    >
      {text}
    </button>
  )
}

export default Button