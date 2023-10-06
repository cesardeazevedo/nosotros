import { useEffect } from 'react'

function PostTwitterEmbed(props: { url: URL }) {
  const { url } = props

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    document.getElementsByClassName('twitter-embed')[0].appendChild(script)
  }, [url])

  return (
    <div className='twitter-embed'>
      <blockquote className='twitter-tweet'>
        <a href={url.toString()}></a>
      </blockquote>
    </div>
  )
}

export default PostTwitterEmbed
