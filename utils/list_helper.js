let _ = require('lodash');

const dummy = (blogs) => {
    return 1;
}

const totalLikes = (blogs) => {
    let t = blogs.reduce((sum, blog) => {
        return sum += blog.likes
    }, 0)
    return t
}

const favoriteBlog = (blogs) => {
    let max = Math.max(...blogs.map((b) => b.likes))
    return blogs.find((b) => b.likes === max)
}

const mostBlogs = (blogs) => {
    const obj = _.countBy(blogs, 'author')
    //{name: 1, name: 2, name: 3}
    const sortedAuthorCounts = _.sortBy(obj, (v) => -v)
    const auth = Object.entries(obj).find((e) => e[1] === sortedAuthorCounts[0])
    const res = { author: auth[0], blogs: auth[1] }
    return res
}

const mostLikes = (blogs) => {
    const names = _.uniq(blogs.map((obj) => obj.author))
    let winner = { author: '', likes: 0 }
    names.forEach((name) => {
        let filtered = blogs.filter((b) => b.author === name)
        let total = filtered.reduce((sum, i) => sum += i.likes, 0)
        if (total > winner.likes) {
            winner = { author: name, likes: total }
        }
    })
    return winner
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}