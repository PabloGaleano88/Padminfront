import padminLogo from '../../assets/images/padmin_logo.png'
import './header.css'

const Header = () => {
    return (
        <>
            <header className="header">
                <img src={padminLogo} className="logo" alt="Padmin Logo" />
                <div className="falling-stars">
                    <div className="star"></div>
                    <div className="star"></div>
                    <div className="star"></div>
                    <div className="star"></div>
                    <div className="star"></div>
                </div>

            </header>

        </>
    )
}

export default Header