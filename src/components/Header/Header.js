import React from 'react'
import { IndexLink, Link } from 'react-router'
import './Header.scss'

export const Header = () => (
  <div>
    <h1>React Redux Chat</h1>
    <IndexLink to='/' activeClassName='route--active'>
      Home
    </IndexLink>
    {' · '}
    <Link to='/chat' activeClassName='route--active'>
      Chat
    </Link>
  </div>
)

export default Header
