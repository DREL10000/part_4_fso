const dummy = (blogs) => {
    return 1;
}

const totalLikes = (blogs) => {
    let t = blogs.reduce((sum, blog) => {
        return sum += blog.likes
    }, 0)
    return t
}

module.exports = {
    dummy,
    totalLikes
}