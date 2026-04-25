interface PeripheralContextProps {
  prev?: string | null
  next?: string | null
  periMult?: number
}

export function PeripheralContext({ prev, next, periMult }: PeripheralContextProps) {
  const style = periMult
    ? { fontSize: `calc(clamp(1.3rem, 2.2vw, 2.1rem) * ${periMult})` }
    : undefined
  return (
    <div className="peripheral" aria-hidden="true" style={style}>
      <div className="peripheral-prev">{prev || ''}</div>
      <div className="peripheral-next">{next || ''}</div>
    </div>
  )
}
