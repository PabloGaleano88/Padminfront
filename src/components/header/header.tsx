import padminLogo from '../../assets/images/padmin_logo.png'
import './header.css'

const Header = () => {
    return (
        <>
            <header className="header">
                <img src={padminLogo} className="logo" alt="Padmin Logo" />
            </header>
        </>
    )
}

export default Header