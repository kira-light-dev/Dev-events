'use client';

const Explorebtn = () => {
    return (
        <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={() => console.log("Clicked")}>
            <a href="#">
                Explore events
                <img src="/icons/arrow-down.svg" alt="arrow-down" />
            </a>
        </button>
    )
}
export default Explorebtn
