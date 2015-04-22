<?php

namespace Cunningsoft\MatchBundle\Services;

use Ratchet\ConnectionInterface;
use Ratchet\Wamp\WampServerInterface;

class Pusher implements WampServerInterface
{
    private $publisher;
    protected $subscribedTopics = array();

    public function __construct()
    {
        $this->publisher = new \ZMQSocket(new \ZMQContext(), \ZMQ::SOCKET_PUSH);
        $this->publisher->bind("tcp://*:5557");
    }

    public function onSubscribe(ConnectionInterface $conn, $topic) {
        // When a visitor subscribes to a topic link the Topic object in a  lookup array
        if (!array_key_exists($topic->getId(), $this->subscribedTopics)) {
            $this->subscribedTopics[$topic->getId()] = $topic;
        }
    }
    public function onUnSubscribe(ConnectionInterface $conn, $topic) {
    }
    public function onOpen(ConnectionInterface $conn) {
    }
    public function onClose(ConnectionInterface $conn) {
    }
    public function onCall(ConnectionInterface $conn, $id, $topic, array $params) {
    }
    public function onPublish(ConnectionInterface $conn, $topic, $event, array $exclude, array $eligible) {
        if ($topic == 'adjustSpeed') {
            $this->onSlide($event);
        }
    }
    public function onError(ConnectionInterface $conn, \Exception $e) {
    }

    public function onRender($entry)
    {
        $entryData = json_decode($entry, true);

        // If the lookup topic object isn't set there is no one to publish to
        if (!array_key_exists('livematch', $this->subscribedTopics)) {
            return;
        }

        $topic = $this->subscribedTopics['livematch'];

        // re-send the data to all the clients subscribed to that category
        $topic->broadcast($entryData);
    }

    public function onSlide($entry)
    {
        $this->publisher->send($entry);
    }
}
